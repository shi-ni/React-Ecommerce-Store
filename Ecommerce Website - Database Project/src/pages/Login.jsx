import { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:5000/login',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // On successful login:
            console.log('Login success:', response.data);

            // Store user data (you might want to use context/state management later)
            localStorage.setItem('user', JSON.stringify(response.data));

            // Redirect to homepage or dashboard
            navigate('/');

        } catch (err) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ maxWidth: '500px' }}>
            <h2>Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </Form.Group>

                <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            <span className="ms-2">Logging in...</span>
                        </>
                    ) : 'Login'}
                </Button>
            </Form>

            <p className="mt-3 text-center">
                New user? <Link to="/register">Register here</Link>
            </p>
        </Container>
    );
}