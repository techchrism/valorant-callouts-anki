const fs = require('fs').promises;
const path = require('path');
const AnkiExport = require('anki-apkg-export').default;

(async () =>
{
    const screenshotsDir = './screenshots/';
    const outputDir = './decks/';
    
    try
    {
        await fs.mkdir(outputDir);
    }
    catch(e)
    {
        if(e.code !== 'EEXIST')
        {
            throw e;
        }
    }
    
    const mapDirs = (await fs.readdir(screenshotsDir, {withFileTypes: true})).filter(i => i.isDirectory()).map(i => i.name);
    console.log(`Loaded ${mapDirs.length} map${mapDirs.length === 1 ? '' : 's'}`);
    for(const mapName of mapDirs)
    {
        const apkg = new AnkiExport(mapName);
        
        const screenshots = (await fs.readdir(path.join(screenshotsDir, mapName), {withFileTypes: true})).filter(i => i.isFile()).map(i => i.name);
        for(const screenshot of screenshots)
        {
            apkg.addMedia(screenshot, await fs.readFile(path.join(screenshotsDir, mapName, screenshot)));
            
            let [current, pointing] = screenshot.replace('.jpg', '').split(' - ');
            // Remove suffixes like " (2)"
            pointing = pointing.split(' (')[0];
            apkg.addCard(`<img src="${screenshot}" />`, `Current: ${current}<br>Pointing to: ${pointing}`);
        }
    
        const zip = await apkg.save();
        await fs.writeFile(path.join(outputDir, `${mapName}.apkg`), zip, 'binary');
        console.log(`Completed ${screenshots.length} cards for ${mapName}`);
    }
})();
