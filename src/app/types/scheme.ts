export interface NamedEntity {
	_id: string;
	name: string;
	image?: string;
}

export interface SchemeKeyHighlight {
	schemeName: string;
	launchedBy: string;
	_id?: string;
}

export interface SchemeSubSection {
	subTitle: string;
	subDescription: string;
	_id?: string;
}

export interface SchemeDateEntry {
	label: string;
	date: string; // ISO date string
	_id?: string;
}

export interface SchemeFAQ {
	question: string;
	answer: string;
	_id?: string;
}

export interface SchemeHelplineNumber {
	tollFreeNumber: string;
	emailSupport: string;
	availability: string;
}

export interface SchemeSourcesAndReferences {
	sourceName: string;
	sourceLink: string;
}

export interface SchemeDisclaimer {
	description: string;
}

export interface SchemeImageRef {
	url: string;
	fileId: string;
}

export interface Scheme {
	_id: string;
	schemeTitle: string;
	about: string;
	category: string | NamedEntity;
	state: Array<NamedEntity> | string[];
	publishedOn: string; // ISO date string
	objectives: string;
	excerpt?: string;
	seoTitle?: string;
	seoMetaDescription?: string;
	keyHighlightsOfTheScheme: SchemeKeyHighlight[];
	eligibilityCriteria: SchemeSubSection[];
	financialBenefits: SchemeSubSection[];
	requiredDocuments: SchemeSubSection[];
	importantDates: SchemeDateEntry[];
	salientFeatures: SchemeSubSection[];
	applicationProcess: SchemeSubSection[];
	frequentlyAskedQuestions: SchemeFAQ[];
	isActive: boolean;
	isFeatured?: boolean;
	bannerImage?: SchemeImageRef;
	cardImage?: SchemeImageRef;
	helplineNumber?: SchemeHelplineNumber;
	sourcesAndReferences?: SchemeSourcesAndReferences;
	disclaimer?: SchemeDisclaimer;
	listCategory?: string[];
    textWithHTMLParsing: string;
}

export interface SchemeFormData {
	schemeTitle: string;
	publishedOn: string;
	about: string;
	objectives: string;
	category: string | { value: string } | NamedEntity | '';
	state: string | { value: string } | NamedEntity | '';
	excerpt: string;
	seoTitle: string;
	seoMetaDescription: string;
	keyHighlightsOfTheScheme: SchemeKeyHighlight[];
	eligibilityCriteria: SchemeSubSection[];
	financialBenefits: SchemeSubSection[];
	requiredDocuments: SchemeSubSection[];
	importantDates: SchemeDateEntry[];
	salientFeatures: SchemeSubSection[];
	applicationProcess: SchemeSubSection[];
	helplineNumber: SchemeHelplineNumber;
	frequentlyAskedQuestions: SchemeFAQ[];
	sourcesAndReferences: SchemeSourcesAndReferences;
	disclaimer: SchemeDisclaimer;
	listCategory: string[];
	bannerImage: File | null;
	cardImage: File | null;
	isFeatured: boolean;
    textWithHTMLParsing: string;
}

export type State = NamedEntity;
export type Category = NamedEntity;


