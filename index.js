const fs = require('fs')
const path = require('path')
const moment = require('moment')
/**
 * Promise all
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 */
function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function(item,index) {
        promises.push( function(item,i) {
            return new Promise(function(resolve, reject) {
                return block.apply(this,[item,index,resolve,reject]);
            });
        }(item,index))
    });
    return Promise.all(promises);
} //promiseAll

/**
 * read files
 * @param dirname string
 * @return Promise
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 * @see http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
 */
function readFiles(dirname) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, function(err, filenames) {
            if (err) return reject(err);

            promiseAllP(filenames,
                (filename,index,resolve,reject) =>  {

                    fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
                        if (err) return reject(err);
                        return resolve({filename: filename, contents: content});
                    });
                })
                .then(results => {
                    return resolve(results);
                })
                .catch(error => {
                    return reject(error);
                });
        });
    });
}

const attendanceList = []
const uniqueName = {}
const attendanceListFilePath = "/Users/leesebas/Downloads" //Change file path

const processNames = (names, date) => {

    const processedName = (name) => name
            .replace('‹', '')
            .replace('›', '')

    const convertDateTimeToLocal = (date) => {
        return moment(date).format()
    }

    names.forEach((name) => {
        const pname = processedName(name)
        uniqueName[`${pname}`] = true
        attendanceList.push(`${pname}\t ${convertDateTimeToLocal(date)}`)
    })

}

const writeFiles = (data, filename) => {

    fs.writeFile(`./${filename}`, data.join('\n'), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });


}

readFiles(  attendanceListFilePath)
    .then(files => {
        console.log(files)
        files.forEach( (item, index) => {
            const attendance = JSON.parse(item.contents)
            processNames(attendance.attendees, attendance.date)
        });
        writeFiles(Object.keys(uniqueName), 'attendanceName.tsv')
        console.log(Object.keys(uniqueName).length)
        writeFiles(attendanceList, 'attendancefile.tsv')

    })
    .catch( error => {
        console.log( error );
    });

