import { Table, Button, Container, Form, Alert, Spinner } from 'react-bootstrap';
import { useCart } from '../Context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


export default function Cart() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        subtotal,
        checkout,
        clearCart
    } = useCart();
    const [status, setStatus] = useState({ loading: false, error: null });
    const navigate = useNavigate();

    const handleCheckout = async () => {
        setStatus({ loading: true, error: null });
        try {
            const orderId = await checkout();
            navigate(`/order-confirmation/${orderId}`);
        } catch (err) {
            setStatus({ loading: false, error: 'Checkout failed. Please try again.' });
        }
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4">Your Cart</h1>

            {status.error && <Alert variant="danger">{status.error}</Alert>}

            {cart.length === 0 ? (
                <div className="text-center py-4">
                    <p className="fs-5">Your cart is empty</p>
                    <Button variant="primary" href="/games">
                        Browse Games
                    </Button>
                </div>
            ) : (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Game</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, +e.target.value)}
                                            style={{ width: '80px' }}
                                        />
                                    </td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <div className="text-end mt-4">
                        <h4>Total: ${subtotal.toFixed(2)}</h4>
                        <div className="d-flex gap-3 justify-content-end mt-3">
                            <Button
                                variant="outline-secondary"
                                onClick={clearCart}
                                disabled={status.loading}
                            >
                                Clear Cart
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleCheckout}
                                disabled={status.loading}
                            >
                                {status.loading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Processing...
                                    </>
                                ) : 'Proceed to Checkout'}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Container>
    );
}