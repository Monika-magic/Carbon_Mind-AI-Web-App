import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Progress, CircularProgress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-500');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary-500');
  });

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-2');
  });

  it('applies different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders left and right icons', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">L</span>}
        rightIcon={<span data-testid="right-icon">R</span>}
      >
        With Icons
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('applies placeholder', () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });

  it('displays hint message when no error', () => {
    render(<Input hint="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input hint="Hint" error="Error" />);
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('renders with label', () => {
    render(<Select label="Category" options={options} />);
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Select options={options} error="Selection required" />);
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('applies placeholder for first option', () => {
    render(<Select options={options} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });
});

describe('Progress Component', () => {
  it('renders with correct width based on value', () => {
    render(<Progress value={50} max={100} data-testid="progress" />);
    const progress = document.querySelector('.bg-primary-500');
    expect(progress).toBeInTheDocument();
  });

  it('handles different variants', () => {
    const { container } = render(<Progress value={50} variant="gradient" />);
    expect(container.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
  });

  it('handles different sizes', () => {
    const { container } = render(<Progress value={50} size="sm" />);
    const small = container.querySelector('.h-1\\.5');
    expect(small).toBeInTheDocument();
  });

  it('shows label when showLabel is true', () => {
    render(<Progress value={50} showLabel label="Progress" />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });
});

describe('CircularProgress Component', () => {
  it('renders with correct value', () => {
    const { container } = render(<CircularProgress value={50} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays percentage when showValue is true', () => {
    render(<CircularProgress value={75} showValue />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<CircularProgress value={50} label="score" />);
    expect(screen.getByText('score')).toBeInTheDocument();
  });
});

describe('Badge Component', () => {
  it('renders badge name', () => {
    render(<Badge icon={<span>I</span>} name="Test Badge" />);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('shows description', () => {
    render(<Badge icon={<span>I</span>} name="Badge" description="A test badge" />);
    expect(screen.getByText('A test badge')).toBeInTheDocument();
  });

  it('shows locked state when not earned', () => {
    render(<Badge icon={<span>I</span>} name="Badge" earned={false} />);
    expect(screen.getByText('LOCKED')).toBeInTheDocument();
  });

  it('does not show locked state when earned', () => {
    render(<Badge icon={<span>I</span>} name="Badge" earned={true} />);
    expect(screen.queryByText('LOCKED')).not.toBeInTheDocument();
  });
});
