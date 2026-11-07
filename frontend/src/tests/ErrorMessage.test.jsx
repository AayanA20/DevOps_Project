import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../components/ErrorMessage';

describe('ErrorMessage Component', () => {
  it('renders nothing when message is null or empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message text correctly', () => {
    render(<ErrorMessage message="Unable to connect to Instagram servers" />);
    expect(screen.getByText('Unable to connect to Instagram servers')).toBeInTheDocument();
  });

  it('renders retry button and triggers callback when clicked', () => {
    const onRetryMock = vi.fn();
    render(<ErrorMessage message="Request failed" onRetry={onRetryMock} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
