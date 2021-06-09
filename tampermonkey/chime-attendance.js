// ==UserScript==
// @name         Chime Meeting Roster
// @namespace    schuettc
// @version      2.0
// @description  Save Chime snapshot of roster to disk with status
// @author       schuettc@
// @match        https://app.chime.aws/*
// @grant        none
// ==/UserScript==
// Based on Chime Meeting Roster by axelv
// Based on "Chime Save Meeting and Chat Roster: by rmmcharg@
// Based on "Save Chime messages to disk" by krotkov@
(function() {
    'use strict';
    addSaveButtonToMenu();
    setInterval(scrapeChime, 60*5000); //Run every 5 minute
    var timer = setInterval(function() {
        var mainArea = document.querySelector('.MeetingControlsListContainer');
        if (mainArea) {
            addSaveButtonToMenu();
            clearInterval(timer);
        }
    }, 500);
    function addSaveButtonToMenu() {
        var meetingTop = document.querySelector('.MeetingControlsListContainer');
        if (!meetingTop) {
            return;
        }
        console.log("Adding button");
        var saveButton = document.createElement('div');
        saveButton.style.cssText = 'margin-left:16px; margin-right:0px; cursor:pointer; line-height:24px;';
        saveButton.innerHTML = '&#x1f4be;';
        saveButton.title = 'Save currently-loaded chat messages and roster to disk';
        saveButton.addEventListener('click', scrapeChime);
        // meetingTop.insertBefore(saveButton, document.querySelector('.MeetingControlButton'));
        meetingTop.appendChild(saveButton);
    }
    function scrapeChime() {
        var currentDateTime = new Date().toISOString();
        var attendee = '';
        var list = {
            attendees: [],
            invited: [],
            left: [],
            late: [],
            declined: [],
            other: [],
            date: currentDateTime
        };
        var header = '';
        document.querySelectorAll('.MeetingRosterContainer').forEach(function(container) {
            container.childNodes.forEach(function(child) {
                if (child.classList.contains("SidebarHeader")) {
                    header = child.querySelector('.SidebarHeader__text').textContent;
                    console.log(header);
                    //attendees.push(header);
                } else if (child.classList.contains("MeetingRosterContainer__subheader")) {
                    header = child.textContent;
                    console.log(header);
                    // attendees.push(header);
                } else if (child.classList.contains("MeetingRosterItem")) {
                    child.childNodes.forEach(function(c) {
                        if (c.classList.contains("MeetingRosterItem__target")) {
                            attendee = c.querySelector('.MeetingRosterItem__fullName').textContent;
                            console.log(attendee);
                            // console.log(header)
                            if (header.includes("attendees")) {
                                list.attendees.push(attendee)
                            } else if (header.includes("invited")) {
                                list.invited.push(attendee);
                            } else if (header.includes("left")) {
                                list.left.push(attendee);
                            } else if (header.includes("declined")) {
                                list.declined.push(attendee);
                            } else if (header.includes("late")) {
                                list.late.push(attendee);
                            } else {
                                list.other.push(attendee);
                            }
                        }
                    })
                }
            })
        });
        saveAs(currentDateTime+'attendees.json',JSON.stringify(list, null, 2));
    }
    function saveAs(filename, contents) {
        var file = new Blob([contents], {type: 'text/plain'});
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
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
})();