import { Container, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OrderConfirmation() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                console.log('Fetching order ID:', orderId); // Add this

                const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to load order');
                }

                const data = await response.json();
                console.log('Order data received:', data); // Add this

                setOrder({
                    ...data,
                    order_date: new Date(data.order_date).toLocaleString()
                });

            } catch (err) {
                console.error("Order fetch failed:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <h4>Order Error</h4>
                    <p>{error}</p>
                    <p>Order ID: {orderId}</p>
                </Alert>
                <div className="d-flex gap-3">
                    <Button variant="primary" onClick={() => navigate('/cart')}>
                        Back to Cart
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        Return Home
                    </Button>
                </div>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    <h4>Order Not Found</h4>
                    <p>No order found with ID: {orderId}</p>
                </Alert>
                <Button variant="primary" onClick={() => navigate('/')}>
                    Browse Games
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h2 className="mb-0">Order Confirmation</h2>
                </Card.Header>
                <Card.Body>
                    <div className="mb-4">
                        <h5>Order #{order.order_id}</h5>
                        <p className="text-muted">Placed on {order.order_date}</p>
                        <p className={`badge bg-${order.status === 'completed' ? 'success' : 'warning'}`}>
                            Status: {order.status}
                        </p>
                    </div>

                    <Table striped bordered hover className="mb-4">
                        <thead>
                            <tr>
                                <th>Game</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.title}</td>
                                    <td>${item.price.toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="text-end fw-bold">Total:</td>
                                <td className="fw-bold">${order.total_amount}</td>
                            </tr>
                        </tfoot>
                    </Table>

                    <div className="d-flex justify-content-between">
                        <Button variant="outline-primary" onClick={() => navigate('/games')}>
                            Continue Shopping
                        </Button>
                        <Button variant="primary" onClick={() => window.print()}>
                            Print Receipt
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}