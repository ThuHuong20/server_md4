import en from './en'
import vi from './vi'
import ja from './ja'
import { TextType } from './en'


export default (lang: string) => {
    let text: TextType;
    switch (lang) {
        case 'en':
            text = en;
            break
        case 'vi':
            text = vi;
            break
        case 'ja':
            text = ja;
            break
        default:
            text = en
    }
    return text
}