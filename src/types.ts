export interface Document {
    id: string;
    title: string;
    date: string;
    size: string;
    type: string;
    summary: string;
    content?: string;
    translation?: {
        lang: string;
        text: string;
    };
}
