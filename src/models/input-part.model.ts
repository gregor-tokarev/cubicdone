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

// export class InputText implements InputPart {
//     readonly type = 'text'
//     id = nanoid(3)
//
//     constructor(private text: string) {
//
//     }
//
//     get content(): string {
//         return this.text;
//     }
//
//     set content(txt: string) {
//         this.text = txt
//     }
// }
//
// export class InputProject implements InputPart {
//     readonly type = 'project'
//     id = nanoid(3)
//
//     constructor(public text: string, public projectId: string | null) {
//     }
//
//     get content(): string {
//         return this.text
//     }
//
// }
