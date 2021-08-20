// ==UserScript==
// @name         Chime Meeting Roster for Chime 5.0
// @namespace    Sebastian
// @version      1.0
// @description  Save Chime snapshot of roster to disk with status; Made for Chime 5.0; Based on "Chime Meeting Roster 3.0" by schuettc and modified by jiawoon@
// @author       leesebas@
// @match        https://app.chime.aws/*
// ==/UserScript==

(function () {
    "use strict";


    const oneSecond = 1000;
    const fiveSeconds = 5 * oneSecond;
    const oneMinute = 60 * oneSecond;
    const fiveMinutes = 5 * oneMinute;

    const desiredTimeInterval = fiveMinutes // Set to desired interval

    // ----------------- Do not edit below -------------------

    let date = new Date();
    addSaveButtonToMenu();

    var timer = setInterval(function () {
        date = new Date()
        var mainArea = document.querySelector(".nav");
        if (mainArea) {
            // addSaveButtonToMenu();
            // clearInterval(timer);
            scrapeChime()
        }
    }, desiredTimeInterval);

    function addSaveButtonToMenu() {
        const meetingTop = document.querySelector(".nav");
        if (!meetingTop) {
            return;
        }

        console.log("Adding save button to the menu");
        var saveButton = document.createElement("div");
        saveButton.style.cssText = "margin-left:16px; margin-right:0px; cursor:pointer; line-height:24px;";
        saveButton.innerHTML = "&#x1f4be;";
        saveButton.title = "Save currently-loaded chat messages and roster to disk";
        saveButton.addEventListener("click", scrapeChime);
        meetingTop.appendChild(saveButton);
    }

    function scrapeChime() {
        const attendees = [];
        var list = {
            present: [],
            invited: [],
            left: [],
            late: [],
            declined: [],
            other: [],
        };
        let header = "";
        var count = 0;
        document.querySelector(".eVQcHf").querySelectorAll(".fjIuJC").forEach(function (container) {
            container.childNodes.forEach(function (child) {
                if (child.classList.contains("dyNVNu")) {
                    header = child.querySelector(".hOCcPi").textContent;
                } else if (child.classList.contains("kBuraE")) {
                    child.childNodes.forEach(function (c2) {
                        if (c2.classList.contains("eiATpP")) {
                            var index = 0
                            document.querySelectorAll(".RosterCellFocus").forEach(function (c3) {
                                if (index == count){
                                    c3.click()
                                    const attendee = {
                                        name: (document.querySelector(".MRhVW").querySelector(".ch-title") || { textContent: "unknown" }).textContent,
                                        email: (document.querySelector(".ivOodO") || { textContent: "unknown" }).textContent,
                                    };

                                    if (header.includes("Present")) {
                                        attendee.status = "present";
                                    } else if (header.includes("Invited")) {
                                        attendee.status = "invited";
                                    } else if (header.includes("Left")) {
                                        attendee.status = "left";
                                    } else if (header.includes("Declined")) {
                                        attendee.status = "declined";
                                    } else if (header.includes("Late")) {
                                        attendee.status = "late";
                                    } else {
                                        attendee.status = "other";
                                    }
                                    list[attendee.status].push(attendee);
                                    attendees.push(attendee);

                                    count += 1
                                    index = count + 3
                                    c3.click()
                                }
                                index += 1
                            })
                        }
                    })
                }
            });
        });


        saveAs(`attendees-${date.toISOString()}.json`, JSON.stringify({attendees, date: date.toISOString()}, null, 2));

        let attendeesText = "";
        for (const [key, values] of Object.entries(list)) {
            attendeesText += `# ${key} #\n`;
            for (const value of values) {
                attendeesText += `${value.email}\n`;
            }
            attendeesText += "\n";
        }
        // saveAs("attendees_emails.txt", attendeesText);

        attendeesText = "";
        for (const [key, values] of Object.entries(list)) {
            attendeesText += `# ${key} #\n`;
            for (const value of values) {
                attendeesText += `${value.name}\n`;
            }
            attendeesText += "\n";
        }
        // saveAs("attendees_names.txt", attendeesText);
    }

    function saveAs(filename, contents) {
        //console.log("saving", filename, "with contents", contents);
        var file = new Blob([contents], { type: "text/plain" });
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        if (document.querySelector(".MeetingTitle_title")) {
            a.download = document.querySelector(".MeetingTitle_title").textContent + "_" + filename;
        } else {
            a.download = filename;
        }
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
})();