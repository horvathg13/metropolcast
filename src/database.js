import Dexie from 'dexie';

const db = new Dexie('cities');
db.version(1).stores({
    cities: "geonameid, name, latitude, longitude, countryCode, admin1, admin2, population"
});

export default db;