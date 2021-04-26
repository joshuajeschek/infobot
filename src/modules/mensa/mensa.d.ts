interface Img {
    img_big: string,
    img_small: string,
}

interface Price {
    student: number,
    staff: number,
    external: number,
}

interface Meal {
    alcohol: boolean,
    beef: boolean,
    pork: boolean,
    vegetarian: boolean,
    img: Img | undefined,
    category: string | undefined,
    description: string | undefined,
    price: Price | undefined,
}

/**
 * internal interface for a menu
 */
export interface Menu {
    meals: Meal[],
    location: string,
    date: Date,
}

// RESULT FROM REQUEST

interface Meta {
    'xmlns:xsi': string;
    'xsi:noNamespaceSchemaLocation': string;
}

interface Datum_$ {
    tag: string;
    monat: string;
    jahr: string;
}

interface Datum {
    '$': Datum_$;
}

interface Essen_$ {
    id: string;
    kategorie: string;
    bewertung: string;
    img: string;
    img_small: string;
    img_big: string;
    schwein: string;
    rind: string;
    vegetarisch: string;
    alkohol: string;
}

interface Gruppe {
    gruppe: string;
}

interface PriceRes {
    _: string;
    '$': Gruppe;
}

interface Essen {
    '$': Essen_$;
    deutsch: string[];
    pr?: PriceRes[];
}

interface Speiseplan {
    '$': Meta;
    datum: Datum[];
    essen?: Essen[];
}

/**
 * the format of the xml request result
 */
export interface MensaResult {
    speiseplan: Speiseplan;
}
