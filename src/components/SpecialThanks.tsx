import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

const SpecialThanks = () => {
    return (
        <div className="d-flex flex-column gap-3 align-items-center pt-3">
            <Link className="btn btn-success" to={"/Game"}>Back To Game</Link>
            <div className="display-6">Special Thanks</div>
            <Container className="w-50">
                <Row>
                    <Col className='text-end'><img width="150px" src="img/sprite.png" alt="Oops.." /></Col>
                    <Col className='text-start'><a href="https://www.spriters-resource.com/arcade/pacman/sheet/52631/" className="fs-5">The Spriters Resource</a></Col>
                </Row>

                <Row>
                    <Col className='text-end'><img width="150px" src="img/fruit-source.jpg" alt="Oops.." /></Col>
                    <Col className='text-start'><a href="http://www.freepik.com" className="fs-5">Freepik</a></Col>
                </Row>
            </Container>
        </div>
    );
}
 
export default SpecialThanks;