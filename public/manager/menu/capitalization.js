function capitalize(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    
    // If the input string contains only one word, capitalize the first letter and return the result
    if (str.indexOf(' ') === -1) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // If the input string contains multiple words, split the string into an array of words,
    // capitalize the first letter of each word, and join the words back together into a string
    let words = str.split(' ');
    let capitalizedWords = [];
  
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  
    return capitalizedWords.join(' ');
  }