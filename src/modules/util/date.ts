import levenshteinNormalize from './levenshtein_normalize';
import day_levenshtein from './resources/day_levenshtein.json';

/**
 * days of the week from sunday to saturday, DE
 */
export const days_de = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

/**
 * converts a string input to a date (cam be name or formatted)
 */
export function convertToDate(input:string) : Date | undefined {
    const day_arr = input.split('.');

    let date: Date | undefined = undefined;
    let computed = false;

    if (day_arr.length == 1) {
        const days = Number(day_arr[0]);
        if (!isNaN(days)) {
            date = new Date();
            date.setDate(days);
            computed = true;
        }
    }
    else if (day_arr.length == 2) {
        const days = Number(day_arr[0]);
        const months = Number(day_arr[1]);
        if (!isNaN(days) && !isNaN(months)) {
            date = new Date();
            date.setMonth(months - 1);
            date.setDate(days);
            computed = true;
        }
    }
    else {
        const days = Number(day_arr[0]);
        const months = Number(day_arr[1]);
        let years = Number(day_arr[2]);
        if (years < 1000) years += 2000;
        if(!isNaN(days) && !isNaN(months) && !isNaN(years)) {
            date = new Date(years, months - 1, days);
            computed = true;
        }
    }

    if (!computed) {
        const day_diff = Number(levenshteinNormalize(input, day_levenshtein));
        date = new Date();
        if (day_diff < 100) {
            date.setDate(date.getDate() + day_diff);
            return date;
        }
        let weekday = date.getDay();
        weekday -= (weekday == 6) ? 7 : 0;
        date.setDate(date.getDate() + (day_diff - 100) - weekday);
    }

    return date;
}
