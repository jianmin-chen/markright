const regex = /^#{1,6} /;

export default function Outline({ value, onClick }) {
    const toc = value => {
        const headings = value.split("\n").flatMap((heading, line) => {
            if (regex.test(heading)) {
                let type = regex.exec(heading)[0];
                return {
                    line,
                    heading: heading.slice(type.length),
                    type: type.trim()
                };
            }
            return [];
        });
        return headings;
    };

    return (
        <div className="prose prose-md">
            {toc(value).map((x, idx) => (
                <p
                    className={`no-underline cursor-pointer !mt-0 !mb-1`}
                    key={x.line}>
                    <a className="no-underline" onClick={() => onClick(x.line)}>
                        <b className="font-extrabold">{x.type}</b> {x.heading}
                    </a>
                </p>
            ))}
        </div>
    );
}
