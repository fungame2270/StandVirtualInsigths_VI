import { GraphOfRegions, MeanPriceGraph, PortugalMap,Filters, ModalListings, GraphLine } from './components';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

function App() {
  const [count, setCount] = useState(0);
  const [originalDataset, setOriginalDataset] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [columns, setColums] = useState(["Brand","City","Title","Kilometer","GasType","GearBox","Year", "Price", "EngineSize","Horsepower","Seller"]);
  const [brand,setBrand] = useState("");
  const [city, setCity] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [dimentions, setDimensions] = useState({width:0,height:0});
  const [padding, setPadding] = useState(0);
  const [mode, setMode] = useState("listings");

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width:window.innerWidth *0.85,
        height:window.innerHeight
      });
      setPadding(window.innerWidth *0.15);
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
    <div className='min-h-screen w-screen bg-white text-black px-2'>
      <ModalListings listings={originalDataset} selectedcity={currentCity} selectedbrand={brand} setSelectedcity={setCurrentCity}/>
      <div className='text-4xl font-bold pt-2' style={{paddingLeft:padding/2}}>Stand Virtual Insights</div>
      <div className='bg-black h-[2px] w-full'></div>
      <Filters setBrand={setBrand} brand={brand} mode={mode} setMode={setMode} listings={originalDataset}/>
      <div className='flex gap-4 mt-2 mb-4' style={{paddingLeft:padding/2}}>
        <PortugalMap listings={originalDataset} city={city} setCity={setCity} width={dimentions.width*0.2} setMode={setMode} mode={mode} selectedBrand={brand}/>
        <GraphOfRegions data={originalDataset.filter((d) => brand === "" || d.Brand === brand)} columns={columns} city={city} width={dimentions.width*0.8} mode={mode} setCurrentCity={setCurrentCity}/>
      </div>
      <MeanPriceGraph data={dataset.filter((d) => brand === "" || d.Brand === brand)} columns={columns.filter((column) => ["Brands","GearBox","GasType","Seller"].includes(column))} city={city} width={dimentions.width} mode={mode}/>
      <GraphLine data={dataset.filter((d) => brand === "" || d.Brand === brand)} columns={columns.filter((column) => ["Kilometer","Horsepower","EngineSize","Year"].includes(column))} city={city} width={dimentions.width} mode={mode}/>
    </div>
  )
}

export default App;
