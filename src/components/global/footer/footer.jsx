import React from "react";
import './footer.scss';

class Footer extends React.Component {
    constructor(props){
        super(props)
    }
    render(){
        return(
            <div className="footer">
                <span>&copy; Meredori 2021</span>
            </div>
        )
    }
}
export default Footer;