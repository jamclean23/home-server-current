// Controller for download routes

// ====== IMPORTS ======

const path = require('path');


// ====== FUNCTIONS ======

function downloadFile (req, res) {
    const downloadPath = path.join(__dirname, '../public/downloads', req.params.slug)

    console.log('-- DOWNLOAD REQUESTED --');
    console.log('-- Path: ' + downloadPath);

    res.download(downloadPath, (err) => {
        if (err) {
            console.log('-- ERROR WHILE DOWNLOADING --');
            console.log(err);
        } else {
            console.log('-- DOWNLOAD COMPLETE --');
            console.log('-- PAth: ' + downloadPath);
        }
    });
}


// ======= EXPORTS ======

module.exports = {
    downloadFile
}