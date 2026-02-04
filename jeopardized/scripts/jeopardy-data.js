namespace("jeopardized.JeopardyData", {
  "gizmo-atheneum.namespaces.Ajax":"Ajax"
}, ({ Ajax }) => {
  const levels = {
    "level-one": [100, 200, 300, 400, 500],
    "level-two": [200, 400, 600, 800, 1000],
    "level-three": [400, 800, 1200, 1600, 2000],
    "level-four": [1000, 2000, 3000, 4000, 5000]
  }
  const allData = {};
  const getDataFile = function(file,callback) {
    if (allData[file]) {
      callback(allData[file]);
    } else {
      Ajax.get(`https://catchpenny-colonnade.github.io/jeopardized/data/${file}.json`,{
        success: (responseText) => {
          const data = JSON.parse(responseText);
          allData[file] = data;
          callback(data);
        },
        failure: (error) => {
          throw error;
        }
      })
    }
  }
  const randomIndex = function(arr) {
    return Math.floor(Math.random() * arr.length);
  }
  const applyQuestion = function(file, callback) {
    getDataFile(file, (data) => {
      callback(data[Math.floor(Math.random() * data.length)]);
    });
  }
  const applyBoard = function(level, callback) {
    const levelPrices = levels[level];
    getDataFile("dataset", (data) => {
      const allCategories = Array.from(data["categories-by-level"][level]);
      const gameCategories = [];
      while(gameCategories.length < 6) {
        gameCategories.push(allCategories.splice(randomIndex(allCategories),1)[0]);
      }
      callback({
        prices: levelPrices,
        board: gameCategories.reduce((board, category) => {
          const questionsByPrice = data.questions[category];
          board[category] = levelPrices.reduce((column,price) => {
            const questions = questionsByPrice[price];
            column[price] = questions[randomIndex(questions)];
            return column;
          }, {});
          return board;
        }, {})
      });
    });
  }
  return { applyQuestion, applyBoard };
});