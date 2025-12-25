declare module 'ivrita' {
  class Ivrita {
    constructor(element: HTMLElement, gender: string);
    static MALE: string;
    static FEMALE: string;
    static NEUTRAL: string;
    static genderize(text: string, gender: string): string;
  }
  export default Ivrita;
}
