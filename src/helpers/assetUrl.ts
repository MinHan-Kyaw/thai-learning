export const assetUrl = (path: string, baseUrl: string = import.meta.env.BASE_URL): string =>
  `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
