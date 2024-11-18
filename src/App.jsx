import { Button, GraphOfRegions, MeanPriceGraph, PortugalMap } from './components';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { use } from 'motion/react-client';

function App() {
  const [count, setCount] = useState(0);
  const [originalDataset, setOriginalDataset] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [columns, setColums] = useState(["Brand","City","Title","Kilometer","Gas Type","Gear Box","Year", "Price", "Engine Size","Horsepower","Seller"]);
  const [city, setCity] = useState("");
  const [dimentions, setDimensions] = useState({width:0,height:0});

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width:window.innerWidth,
        height:window.innerHeight
      });
    }

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
  }, []);
    

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dataset.csv")
      const csv = await response.text()

      const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setOriginalDataset(results.data)
        }
      })
    }

    fetchData();
  
  }
  ,[])

  useEffect(() => {
    if (originalDataset.length > 0) {
      let sus = originalDataset.filter((d) => city === "" ||d.City === city);
      setDataset(sus)
    }
  },[originalDataset,city])

  if (originalDataset.length === 0) return <div>Loading...</div>

  return (
    <div className='min-h-screen w-screen bg-white text-black'>
      <div className='text-4xl font-bold'>Stand Virtual Insights</div>
      <div className='bg-black h-[2px] w-full'></div>
      <div className='flex'>
        <PortugalMap listings={originalDataset} setCity={setCity} width={dimentions.width*0.2}/>
        <GraphOfRegions data={dataset} columns={columns} city={city} width={dimentions.width*0.8}/>
      </div>
      <MeanPriceGraph data={dataset} columns={columns.filter((column) => !["Kilometer","Horsepower","Title", "Price","City"].includes(column))} city={city} width={dimentions.width*0.8} />
    </div>
  )
}

export default App;
