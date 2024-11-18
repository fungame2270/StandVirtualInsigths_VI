import { Button, MeanPriceGraph, PortugalMap } from './components';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

function App() {
  const [count, setCount] = useState(0);
  const [dataset, setDataset] = useState([]);
  const [columns, setColums] = useState(["Brand","City","Title","Kilometer","Gas Type","Gear Box","Year", "Price", "Engine Size","Horsepower","Seller"]);
  const [city, setCity] = useState("Aveiro");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dataset.csv")
      const csv = await response.text()

      const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log(results.data)
          setDataset(results.data)
        }
      })
    }

    fetchData();
  
  }
  ,[])

  if (dataset.length === 0) return <div>Loading...</div>

  return (
    <div className='min-h-screen w-screen bg-white text-black'>
      <div className='text-4xl font-bold'>Stand Virtual Insights</div>
      <div className='bg-black h-[2px] w-full'></div>
      <MeanPriceGraph data={dataset} columns={columns.filter((column) => !["Kilometer","Horsepower","Title", "Price","City"].includes(column))} city={city} />
      <PortugalMap listings={dataset} />
    </div>
  )
}

export default App;
