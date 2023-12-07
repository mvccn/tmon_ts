// const Page = () =>{
// 	return (
// 		<div>hello</div>
// 	)
// }
import ReactChart from '../../_components/trade_chart';
export default function Page() {
	return <div>
		<ReactChart apiUrl='/api/db/aggtrades?n=1500'/>
	</div>
  }