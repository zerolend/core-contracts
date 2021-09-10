import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { MAX_UINT_AMOUNT, RAY, WAD, HALF_RAY, HALF_WAD } from '../helpers/constants';
import { ProtocolErrors } from '../helpers/types';
import { WadRayMathWrapper, WadRayMathWrapperFactory } from '../types';
import { getFirstSigner } from '../helpers/contracts-getters';
import { makeSuite } from './helpers/make-suite';
import './helpers/utils/wadraymath';

makeSuite('WadRayMath', () => {
  const { MATH_MULTIPLICATION_OVERFLOW, MATH_ADDITION_OVERFLOW } = ProtocolErrors;

  let wrapper: WadRayMathWrapper;

  before('setup', async () => {
    const factory = new WadRayMathWrapperFactory(await getFirstSigner());
    wrapper = await ((await factory.deploy()) as WadRayMathWrapper).deployed();
  });

  it('Plain getters', async () => {
    expect((await wrapper.wad()).toString()).to.be.eq(WAD);
    expect((await wrapper.halfWad()).toString()).to.be.eq(HALF_WAD);
    expect((await wrapper.ray()).toString()).to.be.eq(RAY);
    expect((await wrapper.halfRay()).toString()).to.be.eq(HALF_RAY);
  });

  it('wadMul()', async () => {
    const a = BigNumber.from('134534543232342353231234');
    const b = BigNumber.from('13265462389132757665657');

    expect(await wrapper.wadMul(a, b)).to.be.eq(a.wadMul(b));
    expect(await wrapper.wadMul(0, b)).to.be.eq('0');
    expect(await wrapper.wadMul(a, 0)).to.be.eq('0');

    const tooLargeA = BigNumber.from(MAX_UINT_AMOUNT).sub(HALF_WAD).div(b).add(1);
    await expect(wrapper.wadMul(tooLargeA, b)).to.be.revertedWith(MATH_MULTIPLICATION_OVERFLOW);
  });

  it('wadDiv()', async () => {
    const a = BigNumber.from('134534543232342353231234');
    const b = BigNumber.from('13265462389132757665657');

    expect(await wrapper.wadDiv(a, b)).to.be.eq(a.wadDiv(b));

    const halfB = b.div(2);
    const tooLargeA = BigNumber.from(MAX_UINT_AMOUNT).sub(halfB).div(WAD).add(1);

    await expect(wrapper.wadDiv(tooLargeA, b)).to.be.revertedWith(MATH_MULTIPLICATION_OVERFLOW);
  });

  it('rayMul()', async () => {
    const a = BigNumber.from('134534543232342353231234');
    const b = BigNumber.from('13265462389132757665657');

    expect(await wrapper.rayMul(a, b)).to.be.eq(a.rayMul(b));
    expect(await wrapper.rayMul(0, b)).to.be.eq('0');
    expect(await wrapper.rayMul(a, 0)).to.be.eq('0');

    const tooLargeA = BigNumber.from(MAX_UINT_AMOUNT).sub(HALF_RAY).div(b).add(1);
    await expect(wrapper.rayMul(tooLargeA, b)).to.be.revertedWith(MATH_MULTIPLICATION_OVERFLOW);
  });

  it('rayDiv()', async () => {
    const a = BigNumber.from('134534543232342353231234');
    const b = BigNumber.from('13265462389132757665657');

    expect(await wrapper.rayDiv(a, b)).to.be.eq(a.rayDiv(b));

    const halfB = b.div(2);
    const tooLargeA = BigNumber.from(MAX_UINT_AMOUNT).sub(halfB).div(RAY).add(1);

    await expect(wrapper.rayDiv(tooLargeA, b)).to.be.revertedWith(MATH_MULTIPLICATION_OVERFLOW);
  });

  it('rayToWad()', async () => {
    const a = BigNumber.from('10').pow(27);
    expect(await wrapper.rayToWad(a)).to.be.eq(a.rayToWad());

    const halfRatio = BigNumber.from(10).pow(9).div(2);
    const tooLarge = BigNumber.from(MAX_UINT_AMOUNT).sub(halfRatio).add(1);

    await expect(wrapper.rayToWad(tooLarge)).to.be.revertedWith(MATH_ADDITION_OVERFLOW);
  });

  it('wadToRay()', async () => {
    const a = BigNumber.from('10').pow(18);
    expect(await wrapper.wadToRay(a)).to.be.eq(a.wadToRay());

    const ratio = BigNumber.from(10).pow(9);
    const tooLarge = BigNumber.from(MAX_UINT_AMOUNT).div(ratio).add(1);
    await expect(wrapper.wadToRay(tooLarge)).to.be.revertedWith(MATH_MULTIPLICATION_OVERFLOW);
  });
});