import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders title and distance widget', () => {
    render(<App />);
    expect(screen.getByText('Projection Distortion Lab')).toBeInTheDocument();
    expect(screen.getByText(/True great-circle distance/i)).toBeInTheDocument();
  });
});
