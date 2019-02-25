var Database = (function () {

  var db;

  function init() {
    return new Promise(function (resolve, reject) {
      var req = window.indexedDB.open('teamDB', 1);
      req.onupgradeneeded = function (e) {
        var db = e.target.result
        if (db.objectStoreNames.contains('teamStore')) {
          db.deleteObjectStore('teamStore');
        };
        var teamStore = db.createObjectStore("teamStore", { keyPath: "team_id" });
        teamStore.createIndex("name", "name", { unique: false });
        teamStore.createIndex("wins", "wins", { unique: false });
      };
      req.onsuccess = function (e) {
        db = e.target.result;
        resolve();
      };
      req.onerror = function (e) {
        reject(e);
      };
    });
  }

  async function insertTeams(teams) {
    var tx = db.transaction('teamStore', 'readwrite');
    var teamStore = tx.objectStore('teamStore');
    for (var i = 0, len = teams.length; i < len; i++) {
      await teamStore.add(teams[i]);
    }
    await tx.complete;
  }

  function getTeamsCount() {
    return new Promise(function (resolve) {
      db.transaction('teamStore', 'readonly').objectStore('teamStore').count().onsuccess = function (e) {
        resolve(e.target.result);
      };
    });
  }

  function getTeams(startIndex, count, sortBy, sortOrder = 'next') {
    return new Promise(function (resolve) {
      var t = db.transaction(['teamStore'], 'readonly');
      var index;
      var teamStore = index = t.objectStore('teamStore');
      if (sortBy) {
        index = teamStore.index(sortBy);
      }
      var teams = [];
      var skipped = false;
      index.openCursor(null, sortOrder).onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor && !skipped && startIndex > 0) {
          skipped = true;
          cursor.advance(startIndex);
          return;
        }
        if (cursor) {
          teams.push(cursor.value);
          if (teams.length < count) {
            cursor.continue();
          } else {
            resolve(teams);
          }
        } else {
          resolve(teams);
        }
      };
    });
  }

  return {
    init,
    insertTeams,
    getTeamsCount,
    getTeams
  }

})();

export default Database;



