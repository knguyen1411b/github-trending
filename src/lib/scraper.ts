import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedRepo {
  author: string;
  name: string;
  avatar: string;
  url: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  currentPeriodStars: number;
  builtBy: {
    username: string;
    avatar: string;
    url: string;
  }[];
}

export interface ScrapedDeveloper {
  rank: number;
  username: string;
  name: string;
  avatar: string;
  url: string;
  sponsorUrl?: string;
  popularRepo: {
    name: string;
    url: string;
    description: string;
  };
}

const GITHUB_BASE_URL = 'https://github.com';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Fetches the raw README.md content of a GitHub repository from main/master/dev branch.
 */
export async function fetchRepoReadme(author: string, name: string): Promise<string> {
  const branches = ['main', 'master', 'dev'];
  for (const branch of branches) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${author}/${name}/${branch}/README.md`;
      const response = await axios.get(rawUrl, {
        timeout: 5000,
        headers: { 'User-Agent': getRandomUserAgent() },
      });
      if (response.data && typeof response.data === 'string') {
        // Truncate README to ~6000 chars to fit optimal token window while preserving key info
        return response.data.slice(0, 6000);
      }
    } catch {
      // Continue trying next branch
    }
  }
  return '';
}

export async function fetchTrendingRepos(language = '', since = 'daily'): Promise<ScrapedRepo[]> {
  try {
    const langPath = language ? `/${encodeURIComponent(language)}` : '';
    const targetUrl = `${GITHUB_BASE_URL}/trending${langPath}?since=${since}`;

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const repos: ScrapedRepo[] = [];

    $('article.Box-row').each((_, element) => {
      const $row = $(element);

      // Title & URL
      const titleLink = $row.find('h2.h3 a').attr('href') || '';
      const fullUrl = titleLink ? `${GITHUB_BASE_URL}${titleLink.trim()}` : '';
      const pathParts = titleLink.trim().split('/').filter(Boolean);
      const author = pathParts[0] || 'Unknown';
      const name = pathParts[1] || 'Unknown';

      // Description
      const description = $row.find('p').text().trim() || '';

      // Language & Color
      const language = $row.find('[itemprop="programmingLanguage"]').text().trim() || 'Unknown';
      const colorStyle = $row.find('.repo-language-color').attr('style') || '';
      const colorMatch = colorStyle.match(/background-color:\s*(#[0-9a-fA-F]{3,6})/);
      const languageColor = colorMatch ? colorMatch[1] : '#8b949e';

      // Stars & Forks
      const starsText = $row.find('a[href$="/stargazers"]').text().trim().replace(/,/g, '') || '0';
      const forksText = $row.find('a[href$="/forks"]').text().trim().replace(/,/g, '') || '0';
      const stars = parseInt(starsText, 10) || 0;
      const forks = parseInt(forksText, 10) || 0;

      // Current period stars (e.g. "123 stars today")
      const periodText = $row.find('span.d-inline-block.float-sm-right').text().trim();
      const periodMatch = periodText.match(/([\d,]+)\s+stars/i);
      const currentPeriodStars = periodMatch ? parseInt(periodMatch[1].replace(/,/g, ''), 10) : 0;

      // Built by contributors
      const builtBy: ScrapedRepo['builtBy'] = [];
      $row.find('span:contains("Built by") a').each((_, contributorEl) => {
        const $contrib = $(contributorEl);
        const contribHref = $contrib.attr('href') || '';
        const contribAvatar = $contrib.find('img').attr('src') || '';
        const username = contribHref.replace('/', '');

        if (username) {
          builtBy.push({
            username,
            avatar: contribAvatar,
            url: `${GITHUB_BASE_URL}${contribHref}`,
          });
        }
      });

      const avatar = builtBy.length > 0 ? builtBy[0].avatar : `https://github.com/${author}.png`;

      if (name !== 'Unknown') {
        repos.push({
          author,
          name,
          avatar,
          url: fullUrl,
          description,
          language,
          languageColor,
          stars,
          forks,
          currentPeriodStars,
          builtBy,
        });
      }
    });

    return repos;
  } catch (error) {
    console.error('Error scraping GitHub Trending Repos:', error);
    return [];
  }
}

export async function fetchTrendingDevelopers(
  language = '',
  since = 'daily'
): Promise<ScrapedDeveloper[]> {
  try {
    const langPath = language ? `/${encodeURIComponent(language)}` : '';
    const targetUrl = `${GITHUB_BASE_URL}/trending/developers${langPath}?since=${since}`;

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const developers: ScrapedDeveloper[] = [];

    $('article.Box-row').each((index, element) => {
      const $row = $(element);

      const username = $row.find('h1.h3 a').attr('href')?.replace('/', '').trim() || '';
      const name = $row.find('h1.h3 a').text().trim() || username;
      const avatar =
        $row.find('img.avatar-user').attr('src') || `https://github.com/${username}.png`;
      const url = `${GITHUB_BASE_URL}/${username}`;

      // Sponsor Link
      const sponsorHref = $row.find('a[aria-label^="Sponsor"]').attr('href') || '';
      const sponsorUrl = sponsorHref ? `${GITHUB_BASE_URL}${sponsorHref}` : undefined;

      // Popular Repo
      const $repoSection = $row.find('article');
      const repoTitle = $repoSection.find('h1 a').text().trim() || '';
      const repoHref = $repoSection.find('h1 a').attr('href') || '';
      const repoDesc = $repoSection.find('div.css-truncate-text').text().trim() || '';

      if (username) {
        developers.push({
          rank: index + 1,
          username,
          name,
          avatar,
          url,
          sponsorUrl,
          popularRepo: {
            name: repoTitle,
            url: repoHref ? `${GITHUB_BASE_URL}${repoHref}` : '',
            description: repoDesc,
          },
        });
      }
    });

    return developers;
  } catch (error) {
    console.error('Error scraping GitHub Trending Developers:', error);
    return [];
  }
}
