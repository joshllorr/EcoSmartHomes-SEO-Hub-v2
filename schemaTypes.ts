export type PageType = "article" | "service" | "faq" | "category";

export type SchemaType =
  | "FAQPage"
  | "Article"
  | "Service"
  | "BreadcrumbList"
  | "RawJsonLd";

export interface BaseJsonLdSchema {
  /** The schema.org type represented by this block */
  type: SchemaType;
  /** Fully formatted JSON-LD string ready for <script type="application/ld+json"> injection */
  json: string;
  /** Optional metadata extracted during generation */
  meta?: Record<string, any>;
  /** Optional validation flag */
  valid?: boolean;
}

export interface FAQPageSchema extends BaseJsonLdSchema {
  type: "FAQPage";
  meta?: {
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export interface ArticleSchema extends BaseJsonLdSchema {
  type: "Article";
  meta?: {
    headline: string;
    description: string;
    url: string;
    image?: string;
    author?: string;
    datePublished?: string;
    dateModified?: string;
    publisher?: string;
  };
}

export interface ServiceSchema extends BaseJsonLdSchema {
  type: "Service";
  meta?: {
    serviceType: string;
    provider: {
      name: string;
      url?: string;
      areaServed?: string | string[];
    };
  };
}

export interface BreadcrumbListSchema extends BaseJsonLdSchema {
  type: "BreadcrumbList";
  meta?: {
    items: Array<{
      name: string;
      url: string;
      position: number;
    }>;
  };
}

export interface RawJsonLdSchema extends BaseJsonLdSchema {
  type: "RawJsonLd";
  meta?: undefined;
}

export type TypedJsonLdSchema =
  | FAQPageSchema
  | ArticleSchema
  | ServiceSchema
  | BreadcrumbListSchema
  | RawJsonLdSchema;

export interface FullJsonLdSchema {
  faq?: FAQPageSchema;
  article?: ArticleSchema;
  service?: ServiceSchema;
  breadcrumbs?: BreadcrumbListSchema;
  raw?: RawJsonLdSchema;
}

export interface GenerateFullJsonLdSchemaResult {
  jsonLdSchemas: FullJsonLdSchema;
}
