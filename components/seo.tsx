import { Platform } from "react-native";
import Head from "expo-router/head";
import { SITE, absoluteUrl, pageTitle, type PageSeo } from "@/lib/seo";

export function Seo({ title, description, keywords, path, schema }: PageSeo & { schema?: object }) {
  if (Platform.OS !== "web") return null;

  const full = pageTitle(title);
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(SITE.image);

  return (
    <Head>
      <title>{full}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      {path ? <link rel="canonical" href={canonical} /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      {path ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="pt_BR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schema ? (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      ) : null}
    </Head>
  );
}
