import NavBar from "./NavBar";
import Beta from "./BetaVersion";
import Alpha from "./AlphaVersion";
import { Route, Routes} from 'react-router-dom';

function App() {
    return (
        <>
        <NavBar/>
        <Routes>
            <Route path='/' element={<Beta/>} />
            <Route path='/beta' element={<Beta/>} />
            <Route path='/alpha' element={<Alpha/>} />
        </Routes>
        </>
    )

}

export default App;