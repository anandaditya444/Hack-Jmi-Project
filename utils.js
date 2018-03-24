const allowedCharactersArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q',
  'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9'
];

function randomSessionId(currentSessionsArray) {
  let index1 = Math.floor(Math.random() * 36);
  let index2 = Math.floor(Math.random() * 36);
  let index3 = Math.floor(Math.random() * 36);

  let newSessionId = allowedCharactersArray[index1] + allowedCharactersArray[index2] + allowedCharactersArray[index3];

  return currentSessionsArray.includes(newSessionId) ?
    randomSessionId(currentSessionsArray) : newSessionId;
}

module.exports = exports = {
  randomSessionId
};
