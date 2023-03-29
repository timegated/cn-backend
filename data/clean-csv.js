import * as d3 from 'd3';
import fs from 'fs';
import path from 'path';

const parseCSVToJSON = () => {
  const csv = fs.readFileSync('legal-q.csv', 'utf-8', () => {

  });
  const result = d3.csvParse(csv, (d) => {
    console.log(d);
    return d;
  });
  const jsonPath = path.join(
    path.dirname(csv.substring(0,6)), `${path.basename(csv.substring(0,6), '.csv')}.json`
  )
  fs.writeFileSync(jsonPath, JSON.stringify(result));
  return jsonPath;
};


parseCSVToJSON();