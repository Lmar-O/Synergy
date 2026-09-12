/**
 * Stands in for Clerk's card while clerk-js loads, so the page never flashes
 * blank and nothing shifts when the real card arrives.
 *
 * Every bar sits in a line box the height of the text it replaces, which is
 * what makes this measure the same as the loaded sign-in card rather than ~35px
 * shorter. If you change the card, change these.
 */
export function AuthCardSkeleton() {
  return (
    <div className="auth-skeleton" aria-busy="true" aria-label="Loading">
      <div className="skel-header">
        <SkelLine line={27.5} width="190px" height={20} />
        <SkelLine line={21} width="260px" height={14} />
      </div>

      <div className="skel-social">
        <div className="skel skel-pill" style={{ height: 44 }} />
        <div className="skel skel-pill" style={{ height: 44 }} />
      </div>

      <div className="skel-divider">
        <span className="skel-divider-line" />
        <SkelLine line={19.5} width="18px" height={12} />
        <span className="skel-divider-line" />
      </div>

      <div className="skel-field">
        <SkelLine line={19.5} width="92px" height={13} />
        <div className="skel" style={{ height: 44 }} />
      </div>

      <div className="skel skel-pill skel-submit" style={{ height: 44 }} />

      <div className="skel-footer">
        <SkelLine line={19.5} width="196px" height={13} />
      </div>
    </div>
  );
}

function SkelLine({
  line,
  width,
  height,
}: {
  line: number;
  width: string;
  height: number;
}) {
  return (
    <div className="skel-line" style={{ height: line }}>
      <div className="skel" style={{ width, height }} />
    </div>
  );
}
