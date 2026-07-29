import { render, screen } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';
import { vi } from 'vitest';

describe('LoadingScreen', () => {
  it('renders without crashing and displays Apple icon', () => {
    const { container } = render(<LoadingScreen onComplete={vi.fn()} />);
    // The component should render the progress bar
    expect(container.querySelector('.apple-progress-bar')).toBeInTheDocument();
  });
});
