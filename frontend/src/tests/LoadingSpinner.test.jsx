import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders default loading text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom loading text when passed', () => {
    render(<LoadingSpinner text="Fetching your feed..." size="large" />);
    expect(screen.getByText('Fetching your feed...')).toBeInTheDocument();
  });
});
