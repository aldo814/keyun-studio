export type TemplateVisibility = "private" | "public";

export type Template = {
  id: string;
  name: string;
  category: string;
  visibility: TemplateVisibility;
};
