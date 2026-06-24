import { Fragment, isValidElement, type ReactNode } from "react";
import {
  getPressContext,
  type AppContext,
  type ConfigContext,
  type Layouts,
} from "fumapress";
import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
  type DocsPageProps,
} from "fumadocs-ui/layouts/docs/page";

type PageLayoutProps = Parameters<NonNullable<Layouts["page"]>>[0];

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value)
  );
}

function mergeDefined<T extends object>(
  ...configs: (Partial<T> | undefined)[]
): Partial<T> {
  const out: Record<string, unknown> = {};

  for (const config of configs) {
    if (!config) continue;

    for (const [key, value] of Object.entries(config)) {
      if (value === undefined) continue;

      const current = out[key];
      out[key] =
        isRecord(current) && isRecord(value)
          ? mergeDefined(current, value)
          : value;
    }
  }

  return out as Partial<T>;
}

function getBaseLayoutProps(ctx: AppContext): Partial<DocsLayoutProps> {
  const { name, git } = ctx.siteConfig;

  return {
    githubUrl: git ? `https://github.com/${git.user}/${git.repo}` : undefined,
    nav: { title: name },
  };
}

async function renderBody(
  ctx: AppContext,
  page: ConfigContext["page"],
): Promise<ReactNode> {
  for (const adapter of ctx.adapters) {
    const body = await adapter["core:render-body"]?.call(ctx, page);
    if (body !== undefined) return body;
  }

  throw new Error("[LabWiki] No adapter was able to render this page.");
}

async function renderToc(
  ctx: AppContext,
  page: ConfigContext["page"],
): Promise<DocsPageProps["toc"]> {
  for (const adapter of ctx.adapters) {
    const toc = await adapter["core:render-toc"]?.call(ctx, page);
    if (toc !== undefined) return toc;
  }
}

async function getLastModifiedDate(
  ctx: AppContext,
  page: ConfigContext["page"],
): Promise<Date | undefined> {
  for (const adapter of ctx.adapters) {
    const date = await adapter["core:get-modified-date"]?.call(ctx, page);
    if (date !== undefined) return date;
  }
}

function PageMeta({
  ctx,
  page,
}: {
  ctx: AppContext;
  page: ConfigContext["page"];
}) {
  return (
    <>
      <title>{page.data.title}</title>
      <meta property="og:title" content={page.data.title} />
      {page.data.description ? (
        <meta property="og:description" content={page.data.description} />
      ) : null}
      {ctx.metaConfig?.page?.call(ctx, page)}
      {ctx.data["core:page-meta"]?.map((hook, i) => (
        <Fragment key={i}>{hook(page)}</Fragment>
      ))}
    </>
  );
}

export async function DocsPageWithoutActions({
  lang,
  page,
}: PageLayoutProps) {
  const ctx = getPressContext();
  const source = await ctx.getLoader();
  const inherited = await ctx.layouts.defaultProps?.call(ctx, { lang });
  const layoutProps = mergeDefined<DocsLayoutProps>(
    getBaseLayoutProps(ctx),
    inherited,
  );

  layoutProps.tree ??= source.getPageTree(lang);

  const [body, toc, lastModified] = await Promise.all([
    renderBody(ctx, page),
    renderToc(ctx, page),
    getLastModifiedDate(ctx, page),
  ]);

  return (
    <DocsLayout {...(layoutProps as DocsLayoutProps)}>
      <PageMeta ctx={ctx} page={page} />
      <DocsPage toc={toc}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription className="mb-0">
          {page.data.description}
        </DocsDescription>
        <DocsBody>{body}</DocsBody>
        {lastModified ? <PageLastUpdate date={lastModified} /> : null}
      </DocsPage>
    </DocsLayout>
  );
}
