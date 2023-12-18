// const Page = () =>{
// 	return (
// 		<div>hello</div>
// 	)
// }
'use client'
import { useSearchParams} from 'next/navigation'; 

import ReactChart from '../../_components/trade_chart';
export default function Page() {
	// const searchParams = useSearchParams();
	// //default 1000 if searchParams return null. if searchParams is null, then n is undefined, which is not a number, so n will be 1000
	// const n = searchParams?.get('n') || 1000; 
	// const interval = searchParams?.get('interval') || 100;
	return <div>
		{/* <ReactChart apiUrl={"/api/db/combined?n="+n+"&interval="+interval}/> */}
		<ReactChart />
	</div>
  }
