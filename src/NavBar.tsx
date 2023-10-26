import { Link, useMatch, useResolvedPath } from 'react-router-dom'
import { CustomLinkProperties } from "./interfaces";

export default function NavBar() {
    return (
        <nav className='nav'>
            <Link to='/' className='site-title'>
                Fair Protocol KPIs
            </Link>
            <ul>
                <CustomLink to='/beta'>Beta phase </CustomLink>
                <CustomLink to='/alpha'>Alpha phase </CustomLink>
            </ul>
        </nav>
    )
}

function CustomLink({to, children}: CustomLinkProperties) {
    const resolvePath = useResolvedPath(to);
    const isActive = useMatch({path: resolvePath.pathname, end: true})

    return (
        <li className= {isActive ? 'active' : ''}>
            <Link to={to}>
                {children}
            </Link>  
        </li>
    )

}