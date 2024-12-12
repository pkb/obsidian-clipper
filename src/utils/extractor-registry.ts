import { BaseExtractor } from './extractors/_base';

// Extractors
import { RedditExtractor } from './extractors/reddit';
import { TwitterExtractor } from './extractors/twitter';
import { YoutubeExtractor } from './extractors/youtube';


type ExtractorConstructor = new (document: Document, url: string, schemaOrgData?: any) => BaseExtractor;

interface ExtractorMapping {
	patterns: (string | RegExp)[];
	extractor: ExtractorConstructor;
}

export class ExtractorRegistry {
	private static mappings: ExtractorMapping[] = [];
	private static domainCache: Map<string, ExtractorConstructor | null> = new Map();

	static initialize() {
		// Register all extractors with their URL patterns
		this.register({
			patterns: [
				'twitter.com',
				'x.com'
			],
			extractor: TwitterExtractor
		});

		this.register({
			patterns: [
				'reddit.com',
				'old.reddit.com',
				'new.reddit.com',
				/^https:\/\/[^\/]+\.reddit\.com/
			],
			extractor: RedditExtractor
		});

		this.register({
			patterns: [
				'youtube.com',
				'youtu.be',
				/youtube\.com\/watch\?v=.*/,
				/youtu\.be\/.*/
			],
			extractor: YoutubeExtractor
		});
	}

	static register(mapping: ExtractorMapping) {
		this.mappings.push(mapping);
	}

	static findExtractor(document: Document, url: string, schemaOrgData?: any): BaseExtractor | null {
		try {
			const domain = new URL(url).hostname;
			
			// Check cache first
			if (this.domainCache.has(domain)) {
				const cachedExtractor = this.domainCache.get(domain);
				return cachedExtractor ? new cachedExtractor(document, url, schemaOrgData) : null;
			}

			// Find matching extractor
			for (const { patterns, extractor } of this.mappings) {
				const matches = patterns.some(pattern => {
					if (pattern instanceof RegExp) {
						return pattern.test(url);
					}
					return domain.includes(pattern);
				});

				if (matches) {
					// Cache the result
					this.domainCache.set(domain, extractor);
					return new extractor(document, url, schemaOrgData);
				}
			}

			// Cache the negative result
			this.domainCache.set(domain, null);
			return null;

		} catch (error) {
			console.error('Error in findExtractor:', error);
			return null;
		}
	}

	static clearCache() {
		this.domainCache.clear();
	}
}

// Initialize extractors
ExtractorRegistry.initialize();