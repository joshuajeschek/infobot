import levenshtein from 'js-levenshtein';

interface NormalizeSchema {
    query: string,
    result: string | number,
}

/**
 * compares a query to schemas and returns a value which is given through the schema
 */
export default function levenshteinNormalize(query: string, schemas: NormalizeSchema[]): string | number {
    const scores:number[] = [];
    for(let i = 0; i < schemas.length; i++) {
        scores.push(levenshtein(query, schemas[i].query));
    }

    let min_index = 0;

    for (let i = 0; i < scores.length; i++) {
        if (scores[i] < scores[min_index]) {
            min_index = i;
        }
    }

    return schemas[min_index].result;

}
