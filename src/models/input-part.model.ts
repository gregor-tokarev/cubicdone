export interface InputPart {
  id: string;
  type: string;
  content: string;
}

export interface InputProjectPart extends InputPart {
  projectId: string | null;
}

export interface InputTextPart extends InputPart {}

export type InputGenericPart = InputProjectPart | InputTextPart;
