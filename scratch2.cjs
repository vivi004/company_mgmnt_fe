const apiKey = 'AIzaSyAMn8-dHWyXKRTbV7_Idx-viEcj0HlIpJo';
const sheetId = '1gSE3fMAzka_eIlIU2sFR4xC4_IxJTeHAgJkp5YQCSvM';

async function fetchSheet() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:M17?key=${apiKey}&valueRenderOption=UNFORMATTED_VALUE`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data.values, null, 2));
}
fetchSheet();
