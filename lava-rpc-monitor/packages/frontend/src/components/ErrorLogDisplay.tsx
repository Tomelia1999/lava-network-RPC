import React from 'react';

interface Props {
    errorMessages: string[];
}

const ErrorLogDisplay: React.FC<Props> = ({ errorMessages }) => {
    const errorCount = errorMessages ? errorMessages.length : 0;
    return (
        <div>
            <h3>Errors ({errorCount})</h3>
            {errorCount > 0 ? (
                <ul>
                    {errorMessages.slice(-10).map((errorMsg, index) => (
                        <li key={index}>
                            {errorMsg}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No recent errors.</p>
            )}
        </div>
    );
};

export default ErrorLogDisplay; 