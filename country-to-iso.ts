import {normalize, removeSpaces} from "./strings";
import {latinize} from "./latinize";
import alpha2s from './iso-alpha-2.json';
import alpha3s from './iso-alpha-3.json';
import names from './names.json'
export const countryToAlpha2 = (str: any) : string|null  => {
    // Check it's a string at least 2 chars long
    if (typeof str !== "string" || str.length < 2) {
        return null;
    }

    const country = removeSpaces(normalize(latinize(str)));

    // Too short
    if (country.length < 2) {
        return null;
    }

    // Already ISO 3166 alpha 2
    if (country.length === 2 && alpha2s.includes(country)) {
        return country;
    }

    // Is ISO 3166 alpha 3
    if (country.length === 3 && alpha3s[country]) {
        return alpha3s[country];
    }

    // Exact match
    if (names[country]) {
        return names[country];
    }

    return null;
}