export const answer = (question) => {
  // Remove "What is" prefix and "?" suffix
  const match = question.match(/^What is\s*(.*?)\s*\?$/);
  if (!match) {
    throw new Error('Unknown operation');
  }

  const expression = match[1].trim();

  // Check for empty expression
  if (!expression) {
    throw new Error('Syntax error');
  }

  // Try to parse as just a number
  const singleNumber = parseFloat(expression);
  if (!isNaN(singleNumber) && expression === singleNumber.toString()) {
    return singleNumber;
  }

  // Parse the expression into tokens
  const tokens = expression.split(/\s+/);

  // Must start with a number
  let result = parseFloat(tokens[0]);
  if (isNaN(result)) {
    throw new Error('Syntax error');
  }

  let i = 1;
  while (i < tokens.length) {
    // Expect an operation
    let operation;
    
    if (tokens[i] === 'plus') {
      operation = 'plus';
      i++;
    } else if (tokens[i] === 'minus') {
      operation = 'minus';
      i++;
    } else if (tokens[i] === 'multiplied' && i + 1 < tokens.length && tokens[i + 1] === 'by') {
      operation = 'multiply';
      i += 2;
    } else if (tokens[i] === 'divided' && i + 1 < tokens.length && tokens[i + 1] === 'by') {
      operation = 'divide';
      i += 2;
    } else {
      // Check if it's a number (two numbers in a row) or unknown operation
      const num = parseFloat(tokens[i]);
      if (!isNaN(num)) {
        throw new Error('Syntax error');
      }
      throw new Error('Unknown operation');
    }

    // Expect a number after the operation
    if (i >= tokens.length) {
      throw new Error('Syntax error');
    }

    const operand = parseFloat(tokens[i]);
    if (isNaN(operand)) {
      // Check if it's an operation (two operations in a row)
      if (tokens[i] === 'plus' || tokens[i] === 'minus' || 
          tokens[i] === 'multiplied' || tokens[i] === 'divided') {
        throw new Error('Syntax error');
      }
      throw new Error('Syntax error');
    }

    // Perform the operation
    switch (operation) {
      case 'plus':
        result += operand;
        break;
      case 'minus':
        result -= operand;
        break;
      case 'multiply':
        result *= operand;
        break;
      case 'divide':
        result /= operand;
        break;
    }

    i++;
  }

  return result;
};
