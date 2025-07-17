import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Homepage from './pages/HomePage';
import GameDetail from './pages/GameDetails';
import GamesList from './pages/GamesList'; // Add this import
import CartPage from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import Register from './pages/Register';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';



function App() {
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">GameStore</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/games">Games</Nav.Link> {/* Fixed link */}
            </Nav>
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="my-4">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/games" element={<GamesList />} /> {/* New route */}
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Container>

      <footer className="bg-dark text-white text-center py-3 mt-5">
        <Container>
          <p>© 2025 GameStore. All rights reserved.</p>
        </Container>
      </footer>
    </Router>
  );
}

export default App;