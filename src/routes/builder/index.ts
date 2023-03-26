import * as express from 'express';
import { BayesClassifier, WordNet } from 'natural';


const classifier = new BayesClassifier();
const wordNet = new WordNet();

const training = [["Create a function to calculate the average of a list of numbers" , "Functions"],
["Instantiate an object of the Dog class" ,"Object Oriented Programming"],
["Implement a server-client model to distribute tasks among multiple machines" ,"Distributed Computing"],
["Use an if-else statement to check if a number is even or odd" ,"Control Structures"],
["Define a recursive function to calculate the factorial of a number" ,"Functions"],
["Create a class hierarchy to represent different types of animals" ,"Object Oriented Programming"],
["Implement a load balancing algorithm to distribute incoming requests among different servers" ,"Distributed Computing"],
["Use a for loop to iterate over all the elements in a list" ,"Control Structures"],
["Write a function to generate a random number within a given range" ,"Functions"],
["Define an interface for the Car class to implement" ,"Object Oriented Programming"],
["Use Apache Kafka to stream data between different applications" ,"Distributed Computing"],
["Use a switch statement to execute different blocks of code based on different values of a variable" ,"Control Structures"],
["Create a function to sort a list of strings in alphabetical order" ,"Functions"],
["Implement inheritance by creating a class that inherits from another class" ,"Object Oriented Programming"],
["Deploy a microservices architecture to scale an application" ,"Distributed Computing"],
["Use a while loop to repeatedly execute a block of code until a certain condition is met" ,"Control Structures"],
["Write a function to calculate the area of a circle" , "Object Oriented Programming"],
["Use Apache Spark to perform distributed data processing" ,"Distributed Computing"],
["Use a do-while loop to execute a block of code at least once before checking a condition" ,"Control Structures"],
["Write a function to check if a given string is a palindrome" ,"Functions"],
["Create an abstract class that defines common attributes and methods for a group of related classes" ,"Object Oriented Programming"],
["Implement fault tolerance by replicating data across multiple machines" ,"Distributed Computing"],
["Use a nested loop to iterate over all possible combinations of elements in two lists" ,"Control Structures"],
["Define a function to calculate the greatest common divisor of two numbers" ,"Functions"],
["Use inheritance and abstract classes to implement the Template Method design pattern" ,"Object Oriented Programming"]]

for (const data of training) {
  classifier.addDocument(data[0], data[1]);
}

classifier.train();

export const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { userText } = req.query;

    if (userText && userText !== '') {
      const result = classifier.classify(String(userText));

      res.status(200).json(result);
      return;
    }
    res.status(400).send('Bad Request').end();
  } catch (error) {
    res.status(500).send('Internal Server Error');
    throw error;
  }
})


router.get('/lookup/:word', async (req: express.Request, res: express.Response) => {
  try {
    const { word } = req.params;
    if (word && word !== '') {
      const result = await lookupWord(String(word));

      console.log(result);
      res.status(200).json(result);
      return;
    }
    res.status(400).send('Bad Request');
  } catch (error) {
    res.status(500).send('Internal Server Error');
    throw error;
  }
})


function lookupWord(word: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    wordNet.lookup(word, (results) => {
      if (results) {
        resolve(results);
      } else {
        reject(new Error('Failed to execute word lookup'));
      }
    })
  })
}