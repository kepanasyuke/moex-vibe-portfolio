export interface ColorToken {
  name: string;
  value: string;
  role: string;
}

export interface TypeToken {
  name: string;
  sample: string;
  size: string;
  weight: number;
}

export interface RadiusToken {
  name: string;
  value: number;
}

export interface Tokens {
  colors: ColorToken[];
  typography: TypeToken[];
  spacing: number[];
  radius: RadiusToken[];
}

export interface ComponentMeta {
  name: string;
  purpose: string;
  status: string;
}

export interface Rule {
  id: string;
  title: string;
  text: string;
  code: string;
}

export interface Catalog {
  components: ComponentMeta[];
  rules: Rule[];
}

const json = <T,>(response: Response): Promise<T> =>
  response.ok ? (response.json() as Promise<T>) : Promise.reject(new Error("Не удалось загрузить"));

export const api = {
  tokens: (): Promise<Tokens> => fetch("/api/tokens").then(json<Tokens>),
  catalog: (): Promise<Catalog> =>
    Promise.all([
      fetch("/api/components").then(json<ComponentMeta[]>),
      fetch("/api/rules").then(json<Rule[]>),
    ]).then(([components, rules]) => ({ components, rules })),
};
